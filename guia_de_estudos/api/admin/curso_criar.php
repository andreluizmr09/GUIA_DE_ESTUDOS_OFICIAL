<?php
// api/admin/curso_criar.php

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

$profissao_id = $data['profissao_id'] ?? 0;
$titulo = $data['titulo'] ?? '';
$link = $data['link'] ?? '';
$ordem = $data['ordem'] ?? 999;
$dificuldade = $data['dificuldade'] ?? 'Iniciante';

if (!$profissao_id || empty($titulo) || empty($link)) {
    jsonResponse(['error' => 'profissao_id, titulo e link são obrigatórios'], 400);
    exit;
}

// VALIDAÇÃO ADICIONAL: Verificar se a profissão existe
$checkProf = $conn->prepare("SELECT id FROM profissoes WHERE id = ?");
$checkProf->bind_param("i", $profissao_id);
$checkProf->execute();
$checkProf->store_result();

if ($checkProf->num_rows === 0) {
    jsonResponse(['error' => 'Profissão não encontrada'], 400);
    $checkProf->close();
    $conn->close();
    exit;
}
$checkProf->close();

$stmt = $conn->prepare("INSERT INTO cursos (profissao_id, titulo, link, ordem, dificuldade) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("issis", $profissao_id, $titulo, $link, $ordem, $dificuldade);

if ($stmt->execute()) {
    jsonResponse(['message' => 'Curso criado com sucesso', 'id' => $stmt->insert_id], 201);
} else {
    jsonResponse(['error' => 'Erro ao criar curso: ' . $stmt->error], 500);
}

$stmt->close();
$conn->close();
?>