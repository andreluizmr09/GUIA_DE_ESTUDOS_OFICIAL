<?php
// api/admin/profissoes.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../../config/database.php';

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (!isAdmin($token)) {
    jsonResponse(['error' => 'Token inválido ou expirado'], 401);
    exit;
}

$result = $conn->query("SELECT * FROM profissoes ORDER BY nome");

$profissoes = [];
while ($row = $result->fetch_assoc()) {
    $profissoes[] = $row;
}

jsonResponse($profissoes, 200);
$conn->close();
?>