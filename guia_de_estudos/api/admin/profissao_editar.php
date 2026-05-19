<?php
// api/admin/profissao_editar.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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

$data = json_decode(file_get_contents('php://input'), true);

$nome = $data['nome'] ?? '';
$descricao = $data['descricao'] ?? '';
$icone = $data['icone'] ?? '💻';

if (empty($nome)) {
    jsonResponse(['error' => 'Nome da profissão é obrigatório'], 400);
    exit;
}

$stmt = $conn->prepare("UPDATE profissoes SET nome = ?, descricao = ?, icone = ? WHERE id = ?");
$stmt->bind_param("sssi", $nome, $descricao, $icone, $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        jsonResponse(['message' => 'Profissão atualizada com sucesso'], 200);
    } else {
        jsonResponse(['error' => 'Profissão não encontrada ou nenhuma alteração feita'], 404);
    }
} else {
    jsonResponse(['error' => 'Erro ao atualizar profissão: ' . $stmt->error], 500);
}

$stmt->close();
$conn->close();
?>