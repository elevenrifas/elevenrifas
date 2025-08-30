-- Versión mejorada de reportar_pago_con_tickets que usa la función auxiliar
CREATE OR REPLACE FUNCTION reportar_pago_con_tickets_v2(
    p_tipo_pago VARCHAR(50),
    p_monto_bs DECIMAL(10,2),
    p_monto_usd DECIMAL(10,2),
    p_tasa_cambio DECIMAL(10,2),
    p_referencia VARCHAR(255),
    p_telefono_pago VARCHAR(20),
    p_banco_pago VARCHAR(100),
    p_cedula_pago VARCHAR(20),
    p_fecha_visita DATE,
    p_estado VARCHAR(50),
    p_comprobante_pago_url VARCHAR(500),
    p_comprobante_pago_nombre VARCHAR(255),
    p_cantidad_tickets INTEGER,
    p_rifa_id UUID,
    p_nombre VARCHAR(255),
    p_cedula VARCHAR(20),
    p_telefono VARCHAR(20),
    p_correo VARCHAR(255)
) RETURNS JSON AS $$
DECLARE
    pago_id UUID;
    ticket_record RECORD;
    tickets_array JSON[] := '{}';
    i INTEGER;
    precio_ticket_rifa DECIMAL(10,2);
    numero_ticket_actual VARCHAR(10);
BEGIN
    -- Iniciar transacción
    BEGIN
        -- PASO 1: Obtener el precio del ticket de la rifa
        SELECT precio_ticket INTO precio_ticket_rifa
        FROM rifas 
        WHERE id = p_rifa_id;
        
        IF precio_ticket_rifa IS NULL THEN
            RAISE EXCEPTION 'No se pudo obtener el precio del ticket para la rifa %', p_rifa_id;
        END IF;
        
        -- PASO 2: Crear el pago
        INSERT INTO pagos (
            tipo_pago,
            estado,
            monto_bs,
            monto_usd,
            tasa_cambio,
            referencia,
            fecha_pago,
            telefono_pago,
            banco_pago,
            cedula_pago,
            fecha_visita,
            rifa_id,
            comprobante_pago_url,
            comprobante_pago_nombre
        ) VALUES (
            p_tipo_pago,
            COALESCE(p_estado, 'pendiente'),
            p_monto_bs,
            p_monto_usd,
            p_tasa_cambio,
            p_referencia,
            NOW(),
            p_telefono_pago,
            p_banco_pago,
            p_cedula_pago,
            p_fecha_visita,
            p_rifa_id,
            p_comprobante_pago_url,
            p_comprobante_pago_nombre
        ) RETURNING id INTO pago_id;

        -- PASO 3: Crear múltiples tickets usando la función auxiliar
        FOR i IN 1..p_cantidad_tickets LOOP
            -- Usar la función auxiliar para generar número único
            numero_ticket_actual := generar_numero_ticket(p_rifa_id);
            
            -- Insertar ticket
            INSERT INTO tickets (
                rifa_id,
                pago_id,
                numero_ticket,
                nombre,
                cedula,
                telefono,
                correo,
                fecha_compra
            ) VALUES (
                p_rifa_id,
                pago_id,
                numero_ticket_actual,
                p_nombre,
                p_cedula,
                p_telefono,
                p_correo,
                NOW()
            ) RETURNING * INTO ticket_record;

            tickets_array := array_append(tickets_array, to_json(ticket_record));
        END LOOP;

        -- Retornar resultado en formato JSON
        RETURN json_build_object(
            'success', true,
            'pago_id', pago_id,
            'pago', json_build_object(
                'id', pago_id,
                'tipo_pago', p_tipo_pago,
                'estado', COALESCE(p_estado, 'pendiente'),
                'monto_usd', p_monto_usd,
                'monto_bs', p_monto_bs,
                'referencia', p_referencia,
                'fecha_pago', NOW()
            ),
            'tickets', tickets_array,
            'cantidad_tickets', p_cantidad_tickets,
            'precio_ticket', precio_ticket_rifa
        );

    EXCEPTION
        WHEN OTHERS THEN
            -- En caso de error, hacer rollback automático
            RAISE EXCEPTION 'Error en transacción: %', SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

