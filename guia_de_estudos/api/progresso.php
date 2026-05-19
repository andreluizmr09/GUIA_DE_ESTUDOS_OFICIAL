<?php
// api/progresso.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Credentials: true');

require_once '../config/database.php';

if (!isLoggedIn()) {
    jsonResponse(['error' => 'Faça login primeiro'], 401);
    exit;
}

$usuario_id = $_SESSION['usuario_id'];

$stmt = $conn->prepare("
    SELECT c.id, c.titulo, c.profissao_id, p.status 
    FROM cursos c 
    LEFT JOIN progresso_usuario p ON c.id = p.curso_id AND p.usuario_id = ?
    ORDER BY c.profissao_id, c.ordem
");
$stmt->bind_param("i", $usuario_id);
$stmt->execute();
$result = $stmt->get_result();

$progresso = [];
while ($row = $result->fetch_assoc()) {
    $progresso[] = $row;
}

jsonResponse($progresso, 200);
$stmt->close();
$conn->close();
?>