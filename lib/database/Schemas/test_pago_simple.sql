-- FUNCIÓN SIMPLIFICADA PARA TEST - SOLO CREAR PAGO
-- Esta función solo crea el pago, sin tickets, para identificar el problema

CREATE OR REPLACE FUNCTION test_pago_simple(
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
    p_rifa_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    pago_id UUID;
    rifa_titulo VARCHAR(255);
BEGIN
    -- PASO 1: Verificar que la rifa existe
    SELECT titulo INTO rifa_titulo
    FROM rifas 
    WHERE id = p_rifa_id;
    
    IF rifa_titulo IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Rifa no encontrada',
            'rifa_id', p_rifa_id
        );
    END IF;
    
    -- PASO 2: Crear SOLO el pago (sin tickets)
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
        rifa_id
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
        p_rifa_id
    ) RETURNING id INTO pago_id;

    -- PASO 3: Retornar resultado simple
    RETURN json_build_object(
        'success', true,
        'pago_id', pago_id,
        'rifa_titulo', rifa_titulo,
        'mensaje', 'Pago creado exitosamente (sin tickets)',
        'timestamp', NOW()
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'sqlstate', SQLSTATE
        );
END;
$$;
