<?php
// config/database.php

$host = 'localhost';
$user = 'root';
$password = '';
$database = 'guia_estudos';
$port = 3306;

// Criar conexão
$conn = new mysqli($host, $user, $password, $database, $port);

// Verificar conexão
if ($conn->connect_error) {
    header('Content-Type: application/json');
    die(json_encode(['error' => 'Erro na conexão com o banco: ' . $conn->connect_error]));
}

// Definir charset para UTF-8
$conn->set_charset("utf8mb4");

// Iniciar sessão para usuários comuns
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Função para verificar se usuário está logado
function isLoggedIn() {
    return isset($_SESSION['usuario_id']);
}

// Função para verificar se é admin (via token)
function isAdmin($token) {
    global $conn;
    
    if (empty($token)) return false;
    
    $stmt = $conn->prepare("SELECT admin_id FROM admin_tokens WHERE token = ? AND expira > NOW()");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();
    $isValid = $result->num_rows > 0;
    $stmt->close(); // Fechar o statement
    
    return $isValid;
}

// Função para gerar token de 6 dígitos
function gerarTokenAdmin() {
    return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
}

// Função para responder JSON
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>