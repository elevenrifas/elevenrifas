-- =====================================================
-- CREAR FUNCIÓN: reportar_pago_con_tickets
-- =====================================================
-- Fecha: $(date)
-- Descripción: Crear función SQL para reportar pagos con comprobantes
-- =====================================================

-- Crear la función reportar_pago_con_tickets
CREATE OR REPLACE FUNCTION public.reportar_pago_con_tickets(
    p_tipo_pago VARCHAR(50),
    p_monto_bs NUMERIC(10,2),
    p_monto_usd NUMERIC(10,2),
    p_tasa_cambio NUMERIC(10,2),
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
    v_pago_id UUID;
    v_ticket_id UUID;
    v_numero_ticket VARCHAR(20);
    v_resultado JSON;
    v_tickets_creados JSON[];
    v_i INTEGER;
BEGIN
    -- Insertar el pago
    INSERT INTO public.pagos (
        tipo_pago,
        monto_bs,
        monto_usd,
        tasa_cambio,
        referencia,
        telefono_pago,
        banco_pago,
        cedula_pago,
        fecha_visita,
        estado,
        comprobante_pago_url,
        comprobante_pago_nombre,
        rifa_id
    ) VALUES (
        p_tipo_pago,
        p_monto_bs,
        p_monto_usd,
        p_tasa_cambio,
        p_referencia,
        p_telefono_pago,
        p_banco_pago,
        p_cedula_pago,
        p_fecha_visita,
        p_estado,
        p_comprobante_pago_url,
        p_comprobante_pago_nombre,
        p_rifa_id
    ) RETURNING id INTO v_pago_id;

    -- Crear tickets
    v_tickets_creados := ARRAY[]::JSON[];
    
    FOR v_i IN 1..p_cantidad_tickets LOOP
        -- Generar número de ticket único
        v_numero_ticket := 'TKT-' || EXTRACT(YEAR FROM NOW()) || '-' || 
                          LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0') || '-' ||
                          LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0') || '-' ||
                          LPAD(v_i::TEXT, 3, '0') || '-' ||
                          SUBSTRING(v_pago_id::TEXT, 1, 8);
        
        -- Insertar ticket
        INSERT INTO public.tickets (
            numero_ticket,
            rifa_id,
            pago_id,
            estado,
            fecha_creacion
        ) VALUES (
            v_numero_ticket,
            p_rifa_id,
            v_pago_id,
            'activo',
            NOW()
        ) RETURNING id INTO v_ticket_id;
        
        -- Agregar a array de tickets creados
        v_tickets_creados := array_append(v_tickets_creados, 
            json_build_object(
                'id', v_ticket_id,
                'numero_ticket', v_numero_ticket,
                'estado', 'activo'
            )::JSON
        );
    END LOOP;

    -- Construir resultado
    v_resultado := json_build_object(
        'success', true,
        'message', 'Pago reportado y tickets creados exitosamente',
        'pago_id', v_pago_id,
        'tickets_creados', v_tickets_creados,
        'total_tickets', p_cantidad_tickets,
        'monto_total_usd', p_monto_usd,
        'monto_total_bs', p_monto_bs
    );

    RETURN v_resultado;

EXCEPTION
    WHEN OTHERS THEN
        -- En caso de error, retornar información del error
        v_resultado := json_build_object(
            'success', false,
            'message', 'Error al reportar pago: ' || SQLERRM,
            'error_code', SQLSTATE,
            'error_detail', SQLERRM
        );
        
        RETURN v_resultado;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentar la función
COMMENT ON FUNCTION public.reportar_pago_con_tickets IS 'Función para reportar pagos y crear tickets automáticamente con soporte para comprobantes';

-- Verificar que la función se creó correctamente
SELECT 
    routine_name, 
    routine_type, 
    data_type,
    routine_definition IS NOT NULL as has_definition
FROM information_schema.routines 
WHERE routine_name = 'reportar_pago_con_tickets' 
AND routine_schema = 'public';

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Mostrar la función creada
\df+ public.reportar_pago_con_tickets


















