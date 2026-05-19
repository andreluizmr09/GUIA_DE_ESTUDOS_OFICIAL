<?php
// api/cadastro.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$nome = $data['nome'] ?? '';
$email = $data['email'] ?? '';
$senha = $data['senha'] ?? '';

if (empty($nome) || empty($email) || empty($senha)) {
    jsonResponse(['error' => 'Todos os campos são obrigatórios'], 400);
    exit;
}

// Verificar se email já existe
$stmt = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows > 0) {
    jsonResponse(['error' => 'Email já cadastrado'], 400);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

// Hash da senha
$senhaHash = password_hash($senha, PASSWORD_DEFAULT);

// Inserir usuário
$stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $nome, $email, $senhaHash);

if ($stmt->execute()) {
    jsonResponse([
        'message' => 'Usuário cadastrado com sucesso',
        'usuario' => [
            'id' => $stmt->insert_id,
            'nome' => $nome,
            'email' => $email
        ]
    ], 201);
} else {
    jsonResponse(['error' => 'Erro ao cadastrar: ' . $stmt->error], 500);
}

$stmt->close();
$conn->close();
?>