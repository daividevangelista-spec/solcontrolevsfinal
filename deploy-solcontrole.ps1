Write-Host "🚀 Iniciando deploy do SolControle..."

Write-Host "📦 Adicionando arquivos..."
git add .

Write-Host "📝 Criando commit..."
git commit -m "update solcontrole"

Write-Host "⬆️ Enviando para GitHub..."
git push origin main

Write-Host "⚡ Publicando Edge Functions..."
supabase functions deploy send-notifications

Write-Host "✅ Deploy finalizado!"
Write-Host "🌐 A Vercel iniciará o deploy automaticamente."