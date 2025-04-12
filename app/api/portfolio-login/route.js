import dbConnect from '@/lib/db'
import PortfolioUser from '@/models/PortfolioUser'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  await dbConnect()

  const { username, password } = await req.json()

  if (!username || !password) {
    return new Response(JSON.stringify({ message: 'Tüm alanlar zorunlu.' }), { status: 400 })
  }

  const user = await PortfolioUser.findOne({ username })

  if (!user) {
    return new Response(JSON.stringify({ message: 'Kullanıcı bulunamadı.' }), { status: 401 })
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password)

  if (!isPasswordCorrect) {
    return new Response(JSON.stringify({ message: 'Şifre hatalı.' }), { status: 401 })
  }

  return new Response(JSON.stringify({ message: 'Giriş başarılı' }), { status: 200 })
}