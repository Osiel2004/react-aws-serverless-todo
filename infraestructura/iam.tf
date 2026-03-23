# 1. Rol base que permite a AWS ejecutar la Lambda
resource "aws_iam_role" "lambda_role" {
  name = "rol_lambda_tareas"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
    }]
  })
}

# 2. Permiso básico para que la Lambda escriba logs (útil para ver errores)
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# 3. Permiso específico para que la Lambda pueda usar DynamoDB
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "permiso_dynamodb_tareas"
  role = aws_iam_role.lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Scan",
        "dynamodb:DeleteItem",
        "dynamodb:UpdateItem"
      ]
      Resource = aws_dynamodb_table.tabla_tareas.arn
    }]
  })
}