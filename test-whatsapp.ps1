$headers = @{
"Content-Type" = "application/json"
"X-Api-Key" = "solcontrole123"
}

$body = @{
session = "default"
chatId = "5565981296917@c.us"
text = "Teste SolControle funcionando 🚀"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/sendText" -Method Post -Headers $headers -Body $body
$response | ConvertTo-Json
