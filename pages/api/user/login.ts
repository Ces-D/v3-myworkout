import bcrypt from "bcrypt";
import { NextApiResponse } from "next";

import prisma from "../../../lib/db";
import withSession from "../../../lib/session";
import { NextApiRequestWithSession } from "../../../types";

export default withSession(
    async (req: NextApiRequestWithSession, res: NextApiResponse) => {
        try {
            const existingUser = await prisma.user.findUnique({
                where: {
                    userName: req.body.username,
                },
            });
            if (existingUser) {
                const passwordMatch = bcrypt.compare(
                    req.body.password,
                    existingUser.hashedPassword
                );
                if (passwordMatch) {
                    // return users id in a cookie
                    const userId = existingUser.id;
                    req.session.set("user", userId);
                    await req.session.save();
                    res.status(200).json({ existingUser });
                }
                throw new Error("Password or Username incorrect");
            }
            throw new Error("User not found");
        } catch (error) {
            console.error("Login Api Error: ", error);
            res.status(400).json({ error });
        }
    }
);
