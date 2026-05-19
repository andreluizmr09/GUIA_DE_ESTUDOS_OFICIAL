<?php
// api/login.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$senha = $data['senha'] ?? '';

if (empty($email) || empty($senha)) {
    jsonResponse(['error' => 'Email e senha são obrigatórios'], 400);
    exit;
}

// Buscar usuário
$stmt = $conn->prepare("SELECT id, nome, email, senha FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    jsonResponse(['error' => 'Email ou senha inválidos'], 401);
    $stmt->close();
    $conn->close();
    exit;
}

$usuario = $result->fetch_assoc();

if (!password_verify($senha, $usuario['senha'])) {
    jsonResponse(['error' => 'Email ou senha inválidos'], 401);
    $stmt->close();
    $conn->close();
    exit;
}

// Criar sessão
$_SESSION['usuario_id'] = $usuario['id'];
$_SESSION['usuario_nome'] = $usuario['nome'];
$_SESSION['usuario_email'] = $usuario['email'];

jsonResponse([
    'message' => 'Login realizado com sucesso',
    'usuario' => [
        'id' => $usuario['id'],
        'nome' => $usuario['nome'],
        'email' => $usuario['email']
    ]
], 200);

$stmt->close();
$conn->close();
?>