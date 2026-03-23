# 1. Empaquetar el código en un .zip automáticamente
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/lambdas"
  output_path = "${path.module}/lambda.zip"
}

# 2. Crear la función Lambda
resource "aws_lambda_function" "api_tareas" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "GestionarTareas"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "nodejs20.x"

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.tabla_tareas.name
    }
  }
}

# 3. Crear el API Gateway (HTTP API - más rápida y barata)
resource "aws_apigatewayv2_api" "api_gateway" {
  name          = "tareas-http-api"
  protocol_type = "HTTP"
  
  # Configuración rápida de CORS para todo el API
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
  }
}

# 4. Integrar el API Gateway con la Lambda
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.api_gateway.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.api_tareas.invoke_arn
}

# 5. Crear la ruta principal "Comodín" que enviará todo a la Lambda
resource "aws_apigatewayv2_route" "ruta_todas" {
  api_id    = aws_apigatewayv2_api.api_gateway.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# 6. Desplegar el API Gateway para que genere una URL
resource "aws_apigatewayv2_stage" "api_stage" {
  api_id      = aws_apigatewayv2_api.api_gateway.id
  name        = "$default"
  auto_deploy = true
}

# 7. Dar permiso al API Gateway para que pueda "despertar" a la Lambda
resource "aws_lambda_permission" "api_gw_permission" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_tareas.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api_gateway.execution_arn}/*/*"
}

# 8. OUTPUT: ¡Esta será la URL base de tu backend!
output "api_endpoint" {
  value = aws_apigatewayv2_api.api_gateway.api_endpoint
}