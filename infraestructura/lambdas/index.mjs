import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export const handler = async (event) => {
  // 1. Cabeceras de seguridad (CORS) obligatorias para React
  const headers = { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
  };

  try {
    // 2. Extracción "A prueba de balas" del método y la ruta
    const method = event.httpMethod || (event.requestContext && event.requestContext.http && event.requestContext.http.method) || "GET";
    const path = event.path || event.rawPath || "/";

    // 3. El navegador SIEMPRE hace una petición OPTIONS primero por seguridad.
    // Le decimos que todo está bien y que puede continuar.
    if (method === "OPTIONS") {
      return { statusCode: 200, headers, body: JSON.stringify({ message: "CORS OK" }) };
    }

    // 4. Lógica de Negocio (CRUD)
    // Usamos ".includes()" en lugar de "===" por si AWS le agrega barras inclinadas extras al final
    if (method === "GET" && path.includes("/tareas")) {
      const result = await dynamo.send(new ScanCommand({ TableName: tableName }));
      return { statusCode: 200, headers, body: JSON.stringify(result.Items || []) };
      
    } else if (method === "POST" && path.includes("/tareas")) {
      // Si la petición es válida, parseamos la tarea
      const requestJSON = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      await dynamo.send(new PutCommand({ TableName: tableName, Item: requestJSON }));
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Tarea guardada", id: requestJSON.id }) };
      
    } else if (method === "DELETE" && path.includes("/tareas/")) {
      // Extraemos el ID dinámicamente, sin importar la posición en la URL
      const partes = path.split('/');
      const id = partes[partes.length - 1]; 
      await dynamo.send(new DeleteCommand({ TableName: tableName, Key: { id: id } }));
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Tarea eliminada" }) };
      
    } else {
      // Si llega aquí, de verdad es una ruta desconocida
      return { statusCode: 404, headers, body: JSON.stringify({ error: `Ruta no soportada en la Lambda: ${method} ${path}` }) };
    }

  } catch (err) {
    // Captura de errores de la base de datos
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Error interno del servidor", detalle: err.message }) };
  }
};