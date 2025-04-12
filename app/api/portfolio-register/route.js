import dbConnect from '@/lib/db'
import PortfolioUser from '@/models/PortfolioUser'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  await dbConnect()

  const { username, password, email, inviteCode } = await req.json()

  if (!username || !password || !email || !inviteCode) {
    return new Response(JSON.stringify({ message: 'Tüm alanlar zorunlu.' }), { status: 400 })
  }

  if (inviteCode !== process.env.PORTFOLIO_INVITE_CODE) {
    return new Response(JSON.stringify({ message: 'Geçersiz davet kodu.' }), { status: 403 })
  }

  const existingUser = await PortfolioUser.findOne({ username })

  if (existingUser) {
    return new Response(JSON.stringify({ message: 'Bu kullanıcı adı zaten mevcut.' }), { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const newUser = await PortfolioUser.create({
    username,
    password: hashedPassword,
    email
  })

  return new Response(JSON.stringify({ message: 'Kayıt başarılı.' }), { status: 201 })
}