<?php
// api/admin/curso_editar.php

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
    jsonResponse(['error' => 'ID do curso é obrigatório'], 400);
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

// VALIDAÇÃO ADICIONAL 1: Verificar se o curso existe
$checkCurso = $conn->prepare("SELECT id FROM cursos WHERE id = ?");
$checkCurso->bind_param("i", $id);
$checkCurso->execute();
$checkCurso->store_result();

if ($checkCurso->num_rows === 0) {
    jsonResponse(['error' => 'Curso não encontrado'], 404);
    $checkCurso->close();
    $conn->close();
    exit;
}
$checkCurso->close();

// VALIDAÇÃO ADICIONAL 2: Verificar se a profissão existe
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

$stmt = $conn->prepare("UPDATE cursos SET profissao_id = ?, titulo = ?, link = ?, ordem = ?, dificuldade = ? WHERE id = ?");
$stmt->bind_param("issisi", $profissao_id, $titulo, $link, $ordem, $dificuldade, $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        jsonResponse(['message' => 'Curso atualizado com sucesso'], 200);
    } else {
        jsonResponse(['error' => 'Curso não encontrado ou nenhuma alteração feita'], 404);
    }
} else {
    jsonResponse(['error' => 'Erro ao atualizar curso: ' . $stmt->error], 500);
}

$stmt->close();
$conn->close();
?>