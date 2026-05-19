<?php
// api/admin/curso_deletar.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE');
header('Access-Control-Allow-Headers: Authorization');

require_once '../../config/database.php';

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (!isAdmin($token)) {
    jsonResponse(['error' => 'Token inválido ou expirado'], 401);
    exit;
}

$id = $_GET['id'] ?? 0;

if (!$id) {
    jsonResponse(['error' => 'ID do curso é obrigatório'], 400);
    exit;
}

$stmt = $conn->prepare("DELETE FROM cursos WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        jsonResponse(['message' => 'Curso deletado com sucesso'], 200);
    } else {
        jsonResponse(['error' => 'Curso não encontrado'], 404);
    }
} else {
    jsonResponse(['error' => 'Erro ao deletar curso: ' . $stmt->error], 500);
}

$stmt->close();
$conn->close();
?>