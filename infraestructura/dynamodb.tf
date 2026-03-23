resource "aws_dynamodb_table" "tabla_tareas" {
  name           = "TareasApp"
  billing_mode   = "PAY_PER_REQUEST" 
  hash_key       = "id" # Esta será nuestra llave principal

  # Definimos el tipo de dato de la llave (S = String/Texto)
  attribute {
    name = "id"
    type = "S"
  }
}

output "dynamodb_table_name" {
  value = aws_dynamodb_table.tabla_tareas.name
}