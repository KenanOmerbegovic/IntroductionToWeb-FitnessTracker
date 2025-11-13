<?php
/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="Fitness Tracker API",
 *     description="API for tracking training progress",
 *     @OA\Contact(
 *         email="kenanomerbegovic@gmail.com",
 *         name="Fitness tracker dev"
 *     )
 * )
 */

/**
 * @OA\Server(
 *     url="http://localhost/fitness-tracker/backend",
 *     description="Local development server"
 * )
 */

/**
 * @OA\SecurityScheme(
 *     securityScheme="ApiKeyAuth",
 *     type="apiKey",
 *     in="header",
 *     name="Authorization"
 * )
 */
?>