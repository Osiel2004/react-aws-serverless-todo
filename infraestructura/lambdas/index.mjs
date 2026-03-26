import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME;

export const handler = async (event) => {
  const headers = { 
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE"
  };

  try {
    const method = event.httpMethod || (event.requestContext?.http?.method) || "GET";
    const path = event.path || event.rawPath || "/";

    // 1. Manejo de Preflight (CORS)
    if (method === "OPTIONS") {
      return { statusCode: 200, headers, body: JSON.stringify({ message: "CORS OK" }) };
    }

    // 2. LEER TAREAS (GET)
    if (method === "GET" && path.includes("/tareas")) {
      const result = await dynamo.send(new ScanCommand({ TableName: tableName }));
      return { statusCode: 200, headers, body: JSON.stringify(result.Items || []) };
      
    } 
    
    // 3. CREAR O EDITAR TAREA (POST)
    // PutCommand en DynamoDB crea el item si el ID no existe, o lo reemplaza si ya existe.
    else if (method === "POST" && path.includes("/tareas")) {
      const requestJSON = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
      
      if (!requestJSON.id || !requestJSON.texto) {
        throw new Error("Faltan campos obligatorios: id o texto");
      }

      await dynamo.send(new PutCommand({ 
        TableName: tableName, 
        Item: {
          id: requestJSON.id,
          texto: requestJSON.texto
        }
      }));
      
      return { 
        statusCode: 200, 
        headers, 
        body: JSON.stringify({ message: "Operación exitosa", id: requestJSON.id }) 
      };
      
    } 
    
    // 4. ELIMINAR TAREA (DELETE)
    else if (method === "DELETE" && path.includes("/tareas/")) {
      const partes = path.split('/');
      const id = partes[partes.length - 1]; 
      await dynamo.send(new DeleteCommand({ TableName: tableName, Key: { id: id } }));
      return { statusCode: 200, headers, body: JSON.stringify({ message: "Tarea eliminada" }) };
      
    } 
    
    else {
      return { statusCode: 404, headers, body: JSON.stringify({ error: "Ruta no encontrada" }) };
    }

  } catch (err) {
    console.error(err);
    return { 
      statusCode: 500, 
      headers, 
      body: JSON.stringify({ error: "Error en el servidor", detalle: err.message }) 
    };
  }
};