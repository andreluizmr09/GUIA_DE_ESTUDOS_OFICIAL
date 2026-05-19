<?php
// api/admin/profissao_criar.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../../config/database.php';

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (!isAdmin($token)) {
    jsonResponse(['error' => 'Token inválido ou expirado'], 401);
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

$stmt = $conn->prepare("INSERT INTO profissoes (nome, descricao, icone) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $nome, $descricao, $icone);

if ($stmt->execute()) {
    jsonResponse(['message' => 'Profissão criada com sucesso', 'id' => $stmt->insert_id], 201);
} else {
    if ($conn->errno === 1062) {
        jsonResponse(['error' => 'Profissão já existe'], 400);
    } else {
        jsonResponse(['error' => 'Erro ao criar profissão: ' . $stmt->error], 500);
    }
}

$stmt->close();
$conn->close();
?>