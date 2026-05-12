import { useState } from "react";
import Button from "../../../components/ui/Button";

export function newUser({}){

    const [formData, setFormData] = useState({

    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    return (
        <>
            <div>
                <div style={{"display":"flex", "justifyContent":"center", "alignItems":"center", "height":"100%"}}>
                    <div className='login-container' style={{"backgroundColor":"white"}}>
                        <form className='login-form' onSubmit={handleSubmit}>

                            {/* DNI */}
                            <label>
                                <input
                                type="text"
                                placeholder="DNI"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                />
                            </label>

                            {/* Password */}
                            <label>
                                <input
                                type="password"
                                placeholder="Contraseña"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                />
                            </label>

                            {/* Confirmación */}
                            <label>
                                <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                />
                            </label>

                            {/* Nombre */}
                            <label>
                                <input
                                type="text"
                                placeholder="Nombre y apellido"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                />
                            </label>

                            {/* Email */}
                            <label>
                                <input
                                type="text"
                                placeholder="e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                />
                            </label>

                            {/* Teléfono */}
                            <label>
                                <input
                                type="text"
                                placeholder="Teléfono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                />
                            </label>

                            {error && <p style={{ color: "red" }}>{error}</p>}

                            <Button variant="default" type="submit" disabled={loading}>
                                {loading ? "Registrando..." : "Registrar usuario"}
                            </Button>
                        </form>
                    </div>
                </div>
          </div> 
        </>
    );
}