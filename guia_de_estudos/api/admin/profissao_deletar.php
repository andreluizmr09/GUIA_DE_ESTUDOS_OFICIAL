<?php
// api/admin/profissao_deletar.php

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
    jsonResponse(['error' => 'ID da profissão é obrigatório'], 400);
    exit;
}

// Verificar se existem cursos associados
$check = $conn->prepare("SELECT id FROM cursos WHERE profissao_id = ? LIMIT 1");
$check->bind_param("i", $id);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    jsonResponse(['error' => 'Não é possível deletar: existem cursos associados a esta profissão'], 400);
    $check->close();
    $conn->close();
    exit;
}
$check->close();

$stmt = $conn->prepare("DELETE FROM profissoes WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        jsonResponse(['message' => 'Profissão deletada com sucesso'], 200);
    } else {
        jsonResponse(['error' => 'Profissão não encontrada'], 404);
    }
} else {
    jsonResponse(['error' => 'Erro ao deletar profissão: ' . $stmt->error], 500);
}

$stmt->close();
$conn->close();
?>