-- Función para generar números de ticket únicos de manera eficiente
CREATE OR REPLACE FUNCTION generar_numero_ticket(rifa_id_param UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
    numero_ticket VARCHAR(10);
    intentos INTEGER := 0;
    max_intentos INTEGER := 50;
    timestamp_actual BIGINT;
BEGIN
    -- Estrategia 1: Usar timestamp + random para mayor unicidad
    timestamp_actual := extract(epoch from now())::BIGINT;
    
    LOOP
        intentos := intentos + 1;
        
        -- Si se exceden los intentos, usar timestamp como fallback
        IF intentos > max_intentos THEN
            numero_ticket := (100000 + (timestamp_actual % 900000))::VARCHAR;
            EXIT;
        END IF;
        
        -- Generar número combinando timestamp, random y contador de intentos
        numero_ticket := (
            100000 + 
            (timestamp_actual % 100000) + 
            (random() * 1000)::INTEGER + 
            intentos
        )::VARCHAR;
        
        -- Verificar que el número no exista en esta rifa
        EXIT WHEN NOT EXISTS (
            SELECT 1 FROM tickets 
            WHERE rifa_id = rifa_id_param 
            AND numero_ticket = numero_ticket
        );
    END LOOP;
    
    RETURN numero_ticket;
END;
$$ LANGUAGE plpgsql;

