UPDATE employees
SET "organizationId" = CASE franchise_code
    WHEN 'cupertino' THEN 'org_2fi84m36eck5i1dZNDNJYIgu8On'
    WHEN 'fremont' THEN 'org_2fi8BtZhoXEi5b54Xks8cTex4e2'
    WHEN 'pleasanton' THEN 'org_2fi8D8X4ykVw6unR3Qd8MHqUnet'
    WHEN 'los_altos' THEN 'org_2fi8EM7N0xIfi1vFzHM3rRpY0Zt'
    WHEN 'south_san_jose' THEN 'org_2fi8ABN6zToVWQXXoBJgswyI2z8'
    WHEN 'west_san_jose' THEN 'org_2fi88LcvHY77RHL9rkFysCDqHLF'
    ELSE "organizationId"  -- keeps current organization_id if franchise_code does not match
END
WHERE franchise_code IN ('cupertino', 'fremont', 'pleasanton', 'los_altos', 'south_san_jose', 'west_san_jose');
