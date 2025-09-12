-- Función para generar números de ticket únicos de manera eficiente
CREATE OR REPLACE FUNCTION generar_numero_ticket(rifa_id_param UUID)
RETURNS VARCHAR(10) AS $$
DECLARE
    numero_ticket VARCHAR(10);
    intentos INTEGER := 0;
    max_intentos INTEGER := 50;
    total_tickets_rifa INTEGER;
    timestamp_actual BIGINT;
BEGIN
    -- Obtener total_tickets de la rifa
    SELECT total_tickets INTO total_tickets_rifa
    FROM rifas 
    WHERE id = rifa_id_param;
    
    IF total_tickets_rifa IS NULL THEN
        RAISE EXCEPTION 'No se pudo obtener total_tickets para la rifa %', rifa_id_param;
    END IF;
    
    -- Estrategia 1: Usar timestamp + random para mayor unicidad
    timestamp_actual := extract(epoch from now())::BIGINT;
    
    LOOP
        intentos := intentos + 1;
        
        -- Si se exceden los intentos, usar timestamp como fallback
        IF intentos > max_intentos THEN
            numero_ticket := (1 + (timestamp_actual % total_tickets_rifa))::VARCHAR;
            EXIT;
        END IF;
        
        -- Generar número aleatorio entre 1 y total_tickets_rifa
        numero_ticket := (1 + floor(random() * total_tickets_rifa))::VARCHAR;
        
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

