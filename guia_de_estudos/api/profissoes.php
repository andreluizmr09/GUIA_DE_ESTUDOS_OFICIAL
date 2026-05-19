<?php
// api/profissoes.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../config/database.php';

$result = $conn->query("SELECT * FROM profissoes ORDER BY id");

$profissoes = [];
while ($row = $result->fetch_assoc()) {
    $profissoes[] = $row;
}

jsonResponse($profissoes, 200);
$conn->close();
?>