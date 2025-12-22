<?php
require "db.php";

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare(
  "INSERT INTO users (username, password, role, class)
   VALUES (?, ?, ?, ?)"
);

$stmt->execute([
  $data["username"],
  password_hash($data["password"], PASSWORD_DEFAULT),
  $data["role"],
  $data["class"]
]);

echo json_encode(["success" => true]);
