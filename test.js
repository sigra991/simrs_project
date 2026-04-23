async function testApi() {
  const baseUrl = "http://localhost:5000/api";
  let adminToken = "";
  let dokterToken = "";
  let resepsionisToken = "";
  let apotekerToken = "";
  let patientId = "";
  let pendaftaranId = "";
  let rekamMedisId = "";
  let obatId = "";

  console.log("--- STARTING API TESTS ---");

  try {
    // 1. LOGIN ADMIN
    console.log("\n1. Login Admin...");
    const loginAdmin = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin123" }),
    });
    const loginAdminData = await loginAdmin.json();
    adminToken = loginAdminData.data.token;
    console.log("✅ Admin Login Success");

    // 2. LOGIN RESEPSIONIS
    console.log("\n2. Login Resepsionis...");
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "resepsionis1",
        password: "resepsionis123",
      }),
    });
    const loginResData = await loginRes.json();
    resepsionisToken = loginResData.data.token;
    console.log("✅ Resepsionis Login Success");

    // 3. CREATE PASIEN (Resepsionis)
    console.log("\n3. Create Pasien...");
    const createPasien = await fetch(`${baseUrl}/pasien`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resepsionisToken}`,
      },
      body: JSON.stringify({
        nama: "Budi Testing",
        nik: "1234567890123456",
        tgl_lahir: "1995-05-10",
        alamat: "Jl. Testing No. 123",
        jenis_kelamin: "Laki-laki",
      }),
    });
    const createPasienData = await createPasien.json();
    patientId = createPasienData.data.id;
    console.log("✅ Pasien Created:", createPasienData.data.no_rm);

    // 4. CREATE PENDAFTARAN (Resepsionis)
    console.log("\n4. Create Pendaftaran...");
    const createPendaftaran = await fetch(`${baseUrl}/pendaftaran`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resepsionisToken}`,
      },
      body: JSON.stringify({
        pasienId: patientId,
        keluhan_awal: "Demam dan flu",
        kategori_pembayaran: "UMUM",
        biaya: 50000,
      }),
    });
    const createPendaftaranData = await createPendaftaran.json();
    pendaftaranId = createPendaftaranData.data.id;
    console.log(
      "✅ Pendaftaran Created, Status:",
      createPendaftaranData.data.status,
    );

    // 5. LOGIN DOKTER
    console.log("\n5. Login Dokter...");
    const loginDok = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "dr.sarah", password: "dokter123" }),
    });
    const loginDokData = await loginDok.json();
    dokterToken = loginDokData.data.token;
    console.log("✅ Dokter Login Success");

    // 6. CREATE REKAM MEDIS (Dokter)
    console.log("\n6. Create Rekam Medis...");
    const createRM = await fetch(`${baseUrl}/rekam-medis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${dokterToken}`,
      },
      body: JSON.stringify({
        pendaftaranId: pendaftaranId,
        diagnosa: "Influenza Akut",
        tindakan: "Pemberian obat jalan dan istirahat",
      }),
    });
    const createRMData = await createRM.json();
    rekamMedisId = createRMData.data.id;
    console.log("✅ Rekam Medis Created");

    // 7. GET INVENTORY (to get an obat ID)
    console.log("\n7. Get Inventory...");
    const getInv = await fetch(`${baseUrl}/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const invData = await getInv.json();
    obatId = invData.data[0].id;
    console.log("✅ Inventory Fetched, First Item:", invData.data[0].nama_obat);

    // 8. CREATE RESEP (Dokter)
    console.log("\n8. Create Resep (Decrements Stock)...");
    const createResep = await fetch(
      `${baseUrl}/rekam-medis/${rekamMedisId}/resep`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${dokterToken}`,
        },
        body: JSON.stringify({
          items: [{ inventoryId: obatId, jumlah: 10, dosis: "3x1" }],
        }),
      },
    );
    const resepData = await createResep.json();
    console.log("✅ Resep Created:", resepData.message);

    // 9. CHECK INVENTORY STOCK (Admin)
    console.log("\n9. Check Updated Stock...");
    const checkStock = await fetch(`${baseUrl}/inventory/${obatId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const stockData = await checkStock.json();
    console.log("✅ Current Stock:", stockData.data.stok);

    console.log("\n--- ALL TESTS COMPLETED SUCCESSFULLY ---");
  } catch (error) {
    console.error("❌ Test Failed:", error);
  }
}

testApi();
