# 1. Crea el "Pool" (el directorio donde vivirán tus usuarios)
resource "aws_cognito_user_pool" "pool_tareas" {
  name = "tareas-user-pool"

  # Queremos que los usuarios inicien sesión con su correo electrónico
  username_attributes = ["email"]
  
  # AWS verificará el correo enviando un código automáticamente
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = false
    require_uppercase = true
  }
}

# 2. Crea el "Cliente" (la puerta que usará React para hablar con el Pool)
resource "aws_cognito_user_pool_client" "cliente_tareas" {
  name         = "tareas-client"
  user_pool_id = aws_cognito_user_pool.pool_tareas.id
  
  # Muy importante: debe ser 'false' porque estamos en una app frontend (React)
  generate_secret = false 
}

# 3. Mostrar los IDs al final (los necesitaremos para React en el Bloque 4)
output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.pool_tareas.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.cliente_tareas.id
}