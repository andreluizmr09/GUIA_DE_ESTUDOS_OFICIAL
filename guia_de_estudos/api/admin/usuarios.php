<?php
// api/admin/usuarios.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../../config/database.php';

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (!isAdmin($token)) {
    jsonResponse(['error' => 'Token inválido ou expirado'], 401);
    exit;
}

$result = $conn->query("SELECT id, nome, email, criado_em FROM usuarios ORDER BY criado_em DESC");

$usuarios = [];
while ($row = $result->fetch_assoc()) {
    $usuarios[] = $row;
}

jsonResponse($usuarios, 200);
$conn->close();
?>