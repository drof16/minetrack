<?php

use Illuminate\Support\Facades\Route;

Route::view('/privacy-policy', 'privacy-policy');
Route::view('/data-deletion', 'privacy-policy');

Route::view('/{any?}', 'app')->where('any', '.*');
