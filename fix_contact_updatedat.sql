-- Agregar columna updatedAt a la tabla contact si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'contact' AND column_name = 'updatedAt'
    ) THEN
        ALTER TABLE "contact" ADD COLUMN "updatedAt" TIMESTAMP NOT NULL DEFAULT now();
    END IF;
END $$;
