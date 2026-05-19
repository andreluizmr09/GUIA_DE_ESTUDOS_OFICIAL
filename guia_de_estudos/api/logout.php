<?php
// api/logout.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

require_once '../config/database.php';

session_destroy();

jsonResponse(['message' => 'Logout realizado com sucesso'], 200);
?>