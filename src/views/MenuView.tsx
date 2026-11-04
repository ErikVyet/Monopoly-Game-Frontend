import { Canvas } from "@react-three/fiber";
import { CameraControlsImpl, Loader, OrbitControls } from "@react-three/drei";
import { MenuGameScene } from "../components/common/GameScene";
import { Physics } from "@react-three/rapier";
import { createXRStore, XR, XROrigin } from "@react-three/xr";
import { useRef, useState } from "react";
import { MenuContext } from "../contexts/MenuContext";
import { MenuState } from "../constants/MenuState";
import { blue } from "@mui/material/colors";
import { Alert, Box, IconButton, Snackbar, Tooltip } from "@mui/material";
import { ThreeSixty, ViewInAr } from "@mui/icons-material";
import { SettingContext } from "../contexts/SettingContext";
import { ViewMode } from "../constants/ViewMode";

const store = createXRStore({
    controller: {
        rayPointer: {
            rayModel: {
                color: blue.A700
            }
        }
    },
    depthSensing: true
});

export default function MenuView() {
    const cameraControlsRef = useRef<CameraControlsImpl>(null!);

    const [menuState, setMenuState] = useState<MenuState>("START");
    const [viewMode, setViewMode] = useState<ViewMode>("default");
    const [openAlert, setOpenAlert] = useState(false);
    const [message, setMessage] = useState("");

    store.getState()

    const handleEnterVrMode = () => {
        navigator.xr?.isSessionSupported("immersive-vr").then(supported => {
            if (supported) {
                setViewMode("vr");
                store.enterVR().catch(() => {
                    setViewMode("default")
                    handleOpenAlert("Failed to enter VR mode. Please try again");
                });
            }
            else {
                handleOpenAlert("VR mode is not supported on this device");
            }
        });
    };
    const handleEnterArMode = () => {
        navigator.xr?.isSessionSupported("immersive-ar").then(supported => {
            if (supported) {
                setViewMode("ar");
                store.enterAR().catch(() => {
                    setViewMode("default");
                    handleOpenAlert("Failed to enter AR mode. Please try again");
                });
            }
            else {
                handleOpenAlert("AR mode is not supported on this device");
            }
        });
    };
    const handleOpenAlert = (message: string) => {
        setMessage(message);
        setOpenAlert(true);
    };
    const handleCloseAlert = () => {
        setOpenAlert(false);
    };

    return (
        <SettingContext.Provider value={{ viewMode, setViewMode }}>
            <MenuContext.Provider value={{ cameraControlsRef, menuState, setMenuState }}>
                <Box className="relative w-full h-screen!">
                    <Canvas className="h-screen! z-0" frameloop={"always"} camera={{ position: [0, 10, 15], fov: 50 }} shadows>
                        <XR store={store}>
                            <XROrigin position={[0, 10, 10]} rotation={[-Math.PI / 4, 0, 0]}/>
                            <directionalLight position={[0, 10, 10]} intensity={1.5} castShadow/>
                            <ambientLight position={[0, 5, 0]} intensity={0.8}/>
                            {/* <gridHelper args={[100, 100]}/> */}
                            {/* <CameraControls ref={cameraControlsRef}/> */}
                            <OrbitControls/>
                            <Physics gravity={[0, -9.81 * 3, 0]}>
                                <group position={viewMode !== "ar" ? [0, 0, 0] : [0, 0.8, -1]} scale={viewMode === "ar" ? 0.02 : 1}>
                                    <MenuGameScene/>
                                </group>
                            </Physics> 
                        </XR>
                    </Canvas>
                    <Loader containerStyles={{ background: "#0f172a" }} innerStyles={{ width: "300px" }} dataInterpolation={(progress) => `Loading Monopoly Board ${progress.toFixed(0)}%`} />
                    <Tooltip title={"VR Mode"} arrow>
                        <IconButton className="absolute! top-4! right-4! z-50! bg-zinc-900/30! hover:bg-zinc-900/20! outline! outline-zinc-700!" onClick={handleEnterVrMode}>
                            <ThreeSixty className="text-zinc-100"/>
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={"AR Mode"} arrow>
                        <IconButton className="absolute! top-4! right-18! z-50! bg-zinc-900/30! hover:bg-zinc-900/20! outline! outline-zinc-700!" onClick={handleEnterArMode}>
                            <ViewInAr className="text-zinc-100"/>
                        </IconButton>
                    </Tooltip>
                </Box>
                <Snackbar open={openAlert} autoHideDuration={3000} anchorOrigin={{ horizontal: "right", vertical: "bottom" }} onClose={handleCloseAlert} onClick={(event) => event.stopPropagation()}>
                    <Alert severity={"error"} variant={"filled"} onClose={handleCloseAlert}>{message}</Alert>
                </Snackbar>
            </MenuContext.Provider>
        </SettingContext.Provider>
    );
}