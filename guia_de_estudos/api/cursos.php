<?php
// api/cursos.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$profissao_id = $_GET['profissao_id'] ?? 0;

if (!$profissao_id) {
    jsonResponse(['error' => 'profissao_id é obrigatório'], 400);
    exit;
}

$stmt = $conn->prepare("SELECT * FROM cursos WHERE profissao_id = ? ORDER BY ordem");
$stmt->bind_param("i", $profissao_id);
$stmt->execute();
$result = $stmt->get_result();

$cursos = [];
while ($row = $result->fetch_assoc()) {
    $cursos[] = $row;
}

jsonResponse($cursos, 200);
$stmt->close();
$conn->close();
?>