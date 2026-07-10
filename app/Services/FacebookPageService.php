<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Item;
use App\Models\Mine;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class FacebookPageService
{
    public function __construct(private readonly MineService $mineService)
    {
    }

    public function status(): array
    {
        return [
            'configured' => $this->isConfigured(),
            'graph_version' => config('services.facebook.graph_version'),
            'page_id' => config('services.facebook.page_id'),
            'has_page_access_token' => filled(config('services.facebook.page_access_token')),
        ];
    }

    public function syncItemComments(Item $item, ?User $user = null, int $limit = 100): array
    {
        $this->ensureConfigured();

        $postId = $this->normalizePostId($item->facebook_post_id) ?: $this->extractPostId($item->facebook_post_url);
        if (! $postId) {
            throw ValidationException::withMessages([
                'facebook_post_id' => ['Add a Facebook post ID or a supported Facebook post URL before syncing comments.'],
            ]);
        }

        if (! $item->facebook_post_id) {
            $item->forceFill(['facebook_post_id' => $postId])->save();
        }

        $comments = $this->fetchComments($postId, $limit);
        $created = [];
        $skipped = [];

        foreach ($comments as $comment) {
            $message = trim((string) ($comment['message'] ?? ''));
            $commentId = (string) ($comment['id'] ?? '');

            if (! Mine::textContainsMineKeyword($message)) {
                $skipped[] = [
                    'facebook_comment_id' => $commentId,
                    'reason' => 'No mine keyword.',
                ];
                continue;
            }

            if ($commentId && Mine::query()->where('facebook_comment_id', $commentId)->exists()) {
                $skipped[] = [
                    'facebook_comment_id' => $commentId,
                    'reason' => 'Already imported.',
                ];
                continue;
            }

            $customer = $this->findOrCreateCustomer($comment);

            try {
                $payload = [
                    'customer_id' => $customer->id,
                    'mine_text' => $message,
                    'facebook_comment_url' => $comment['permalink_url'] ?? null,
                    'mine_time' => isset($comment['created_time']) ? Carbon::parse($comment['created_time']) : now(),
                    'source' => 'facebook_page',
                    'notes' => 'Imported from Facebook Page comments.',
                    'facebook_comment_id' => $commentId ?: null,
                ];

                $mine = $item->mines()->where('status', Mine::STATUS_ACTIVE)->exists()
                    ? $this->mineService->recordBackupMine($item, $payload, $user)
                    : $this->mineService->recordActiveMine($item, $payload, $user);

                if ($commentId && ! $mine->facebook_comment_id) {
                    $mine->forceFill(['facebook_comment_id' => $commentId])->save();
                }

                $created[] = [
                    'mine_id' => $mine->id,
                    'facebook_comment_id' => $commentId,
                    'customer_name' => $customer->name,
                    'status' => $mine->status,
                    'message' => $message,
                ];
            } catch (ValidationException $exception) {
                $skipped[] = [
                    'facebook_comment_id' => $commentId,
                    'reason' => collect($exception->errors())->flatten()->first() ?: 'Mine could not be created.',
                ];
            }
        }

        return [
            'post_id' => $postId,
            'scanned' => count($comments),
            'created' => $created,
            'skipped' => $skipped,
        ];
    }

    private function fetchComments(string $postId, int $limit): array
    {
        $version = config('services.facebook.graph_version');
        $response = Http::timeout(20)->get("https://graph.facebook.com/{$version}/{$postId}/comments", [
            'fields' => 'id,message,created_time,from,permalink_url',
            'filter' => 'stream',
            'order' => 'chronological',
            'limit' => min(max($limit, 1), 100),
            'access_token' => config('services.facebook.page_access_token'),
        ]);

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'facebook' => [$response->json('error.message') ?: 'Facebook comments could not be fetched.'],
            ]);
        }

        return $response->json('data') ?: [];
    }

    private function findOrCreateCustomer(array $comment): Customer
    {
        $from = $comment['from'] ?? [];
        $facebookUserId = $from['id'] ?? null;
        $name = trim((string) ($from['name'] ?? 'Facebook Page Customer'));

        if ($facebookUserId) {
            $customer = Customer::query()->where('facebook_user_id', $facebookUserId)->first();
            if ($customer) {
                return $customer;
            }
        }

        $customer = Customer::query()
            ->where('facebook_name', $name)
            ->orWhere('name', $name)
            ->first();

        if ($customer) {
            if ($facebookUserId && ! $customer->facebook_user_id) {
                $customer->forceFill(['facebook_user_id' => $facebookUserId])->save();
            }

            return $customer;
        }

        return Customer::create([
            'name' => $name,
            'facebook_name' => $name,
            'facebook_user_id' => $facebookUserId,
            'notes' => 'Created from Facebook Page comment import.',
        ]);
    }

    private function extractPostId(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $pageId = config('services.facebook.page_id');

        if (preg_match('/(?:posts|videos|photos|permalink)\/(\d+)/', $url, $matches)) {
            return $pageId ? "{$pageId}_{$matches[1]}" : $matches[1];
        }

        if (preg_match('/fbid=(\d+)/', $url, $matches)) {
            return $pageId ? "{$pageId}_{$matches[1]}" : $matches[1];
        }

        if (preg_match('/story_fbid=(\d+)/', $url, $matches)) {
            return $pageId ? "{$pageId}_{$matches[1]}" : $matches[1];
        }

        if (preg_match('/(\d+_\d+)/', $url, $matches)) {
            return $matches[1];
        }

        $trimmed = trim($url);

        return preg_match('/^\d+$/', $trimmed) ? ($pageId ? "{$pageId}_{$trimmed}" : $trimmed) : null;
    }

    private function normalizePostId(?string $postId): ?string
    {
        $postId = trim((string) $postId);
        if ($postId === '') {
            return null;
        }

        if (preg_match('/^\d+_\d+$/', $postId)) {
            return $postId;
        }

        $pageId = config('services.facebook.page_id');

        return preg_match('/^\d+$/', $postId) && $pageId ? "{$pageId}_{$postId}" : $postId;
    }

    private function isConfigured(): bool
    {
        return filled(config('services.facebook.page_id')) && filled(config('services.facebook.page_access_token'));
    }

    private function ensureConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw ValidationException::withMessages([
                'facebook' => ['Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN in .env before syncing Facebook Page comments.'],
            ]);
        }
    }
}
