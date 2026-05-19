<?php
// api/admin/cursos.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../../config/database.php';

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (!isAdmin($token)) {
    jsonResponse(['error' => 'Token inválido ou expirado'], 401);
    exit;
}

$result = $conn->query("
    SELECT c.*, p.nome as profissao_nome 
    FROM cursos c 
    JOIN profissoes p ON c.profissao_id = p.id 
    ORDER BY c.profissao_id, c.ordem
");

$cursos = [];
while ($row = $result->fetch_assoc()) {
    $cursos[] = $row;
}

jsonResponse($cursos, 200);
$conn->close();
?>