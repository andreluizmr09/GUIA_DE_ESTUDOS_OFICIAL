<?php
// api/login_admin.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

$data = json_decode(file_get_contents('php://input'), true);

$login = $data['login'] ?? '';
$senha = $data['senha'] ?? '';

if (empty($login) || empty($senha)) {
    jsonResponse(['error' => 'Login e senha são obrigatórios'], 400);
    exit;
}

// Buscar admin
$stmt = $conn->prepare("SELECT id, login, senha FROM administradores WHERE login = ?");
$stmt->bind_param("s", $login);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    jsonResponse(['error' => 'Login ou senha inválidos'], 401);
    $stmt->close();
    $conn->close();
    exit;
}

$admin = $result->fetch_assoc();

// Verificar senha (SHA2)
$hashCheck = $conn->prepare("SELECT SHA2(?, 256) as hash");
$hashCheck->bind_param("s", $senha);
$hashCheck->execute();
$hashResult = $hashCheck->get_result();
$hashRow = $hashResult->fetch_assoc();

if ($admin['senha'] !== $hashRow['hash']) {
    jsonResponse(['error' => 'Login ou senha inválidos'], 401);
    $stmt->close();
    $conn->close();
    exit;
}

// Gerar token de 6 dígitos
$token = gerarTokenAdmin();

// Salvar token no banco
$insertToken = $conn->prepare("INSERT INTO admin_tokens (token, admin_id, expira) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))");
$insertToken->bind_param("si", $token, $admin['id']);
$insertToken->execute();

jsonResponse([
    'message' => 'Login admin realizado com sucesso',
    'token' => $token
], 200);

$stmt->close();
$insertToken->close();
$conn->close();
?>