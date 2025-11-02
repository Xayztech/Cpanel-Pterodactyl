import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return res.status(401).json({ error: 'Anda harus login' });
  }

  const {
    userName,
    userEmail,
    userPassword,
    serverName,
    ram,
    disk,
    cpu,
    cores,
  } = req.body;

  const PTERO_API_KEY = process.env.PTERO_APP_KEY;
  const PTERO_DOMAIN = process.env.PTERO_DOMAIN;

  if (!PTERO_API_KEY || !PTERO_DOMAIN) {
    return res
      .status(500)
      .json({ error: 'Server configuration missing API keys' });
  }

  try {
    let isPterodactylAdmin = false;
    if (token.role === 'Admin' || token.role === 'Owner') {
      isPterodactylAdmin = true;
    }

    const userPayload = {
      username: userName,
      email: userEmail,
      first_name: userName,
      last_name: 'User',
      password: userPassword,
      root_admin: isPterodactylAdmin,
    };

    const userResponse = await fetch(`${PTERO_DOMAIN}/api/application/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PTERO_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(userPayload),
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('Pterodactyl User API Error:', errorData);
      return res
        .status(userResponse.status)
        .json({ error: 'Gagal membuat user', details: errorData });
    }

    const newUserData = await userResponse.json();
    const userId = newUserData.attributes.id;

    const finalCPU = cpu === 'Unlimited' ? 0 : parseInt(cpu);
    const finalDisk = disk === 'Unlimited' ? 0 : parseInt(disk);
    const finalRam = ram === 'Unlimited' ? 0 : parseInt(ram);
    
    const startupCommand = 'if [[ -d .git ]] && [[ ${AUTO_UPDATE} == "1" ]]; then git pull; fi; if [[ ! -z ${NODE_PACKAGES} ]]; then /usr/local/bin/npm install ${NODE_PACKAGES}; fi; if [[ ! -z ${UNNODE_PACKAGES} ]]; then /usr/local/bin/npm uninstall ${UNNODE_PACKAGES}; fi; if [ -f /home/container/package.json ]; then /usr/local/bin/npm install; fi; /usr/local/bin/${CMD_RUN}';
    
      const serverPayload = {
      name: serverName,
      user: userId,
      nest: 5,
      egg: 15,
      docker_image: 'ghcr.io/parkervcp/yolks:nodejs_21',
      startup: startupCommand,
      environment: { 
        INST: "npm", 
        USER_UPLOAD: "0", 
        AUTO_UPDATE: "0", 
        CMD_RUN: "npm start",
      },
      limits: { 
        memory: finalRam, 
        swap: 0, 
        disk: finalDisk, 
        io: 500, 
        cpu: finalCPU, 
      },
      feature_limits: {
        databases: 5, 
        allocations: 5, 
        backups: 5 
      },
      deploy: { 
        locations: 1, 
        dedicated_ip: false, 
        port_range: [], 
      },
    };

    const serverResponse = await fetch(
      `${PTERO_DOMAIN}/api/application/servers`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${PTERO_API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(serverPayload),
      }
    );

    if (!serverResponse.ok) {
      const errorData = await serverResponse.json();
      console.error('Pterodactyl Server API Error:', errorData);

      await fetch(`${PTERO_DOMAIN}/api/application/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${PTERO_API_KEY}` },
      });

      return res
        .status(serverResponse.status)
        .json({ error: 'Gagal membuat server', details: errorData });
    }

    const newServerData = await serverResponse.json();

    res.status(201).json({
      message: 'Akun dan server berhasil dibuat!',
      userData: newUserData.attributes,
      serverData: newServerData.attributes,
    });
  } catch (error) {
    console.error('Internal Server Error:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server' });
  }
}