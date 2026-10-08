import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Xóa dữ liệu cũ nếu có
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.campaign.deleteMany();

  // Tạo Campaign mẫu
  const campaign = await prisma.campaign.create({
    data: {
      name: 'Chiến dịch Green Life 2026',
      description: 'Truyền thông sản phẩm tái chế thân thiện với môi trường.'
    }
  });

  // Tạo Post mẫu đã duyệt
  await prisma.post.create({
    data: {
      campaignId: campaign.id,
      topic: 'Ra mắt EcoCup 2026',
      targetAudience: 'Gen Z',
      tone: 'Truyền cảm hứng',
      platform: 'Facebook',
      headline: 'Chung tay vì hành tinh xanh cùng EcoCup',
      content: 'Hãy cùng chúng tôi thay đổi thói quen dùng đồ nhựa dùng một lần ngay hôm nay!\n\n👉 Nhận quà tặng tại đây: ecocup.vn\n\n#GreenLife #EcoCup #Sustainability',
      bannerUrl: 'https://image.pollinations.ai/prompt/Eco-friendly%20coffee%20cup%20on%20minimalist%20wooden%20desk?width=1200&height=630&nologo=true',
      status: 'APPROVED'
    }
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
