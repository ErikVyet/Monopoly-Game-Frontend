import { Container, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";
import { MAJOR, MINOR, PATCH } from "../constants/AppVersion";

export default function MainLayout() {


    return (
        <Container className="min-h-screen max-h-max" maxWidth={false} disableGutters>
            <Outlet/>
            <Typography className="absolute! bottom-0.5 left-1.5 font-fredoka! text-zinc-800! text-sm! select-none">v{MAJOR}.{MINOR}.{PATCH}</Typography>
        </Container>
    );
}