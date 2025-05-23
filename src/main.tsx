import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
import App from "./App.tsx";
import {AppWrapper} from "./components/common/PageMeta.tsx";
import {ThemeProvider} from "./context/ThemeContext.tsx";
import {Toaster} from "react-hot-toast";


createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Toaster position="top-center" toastOptions={{style: {zIndex: 9999}}}/>
        <ThemeProvider>
            <AppWrapper>
                <App/>
            </AppWrapper>
        </ThemeProvider>
    </StrictMode>,
);
