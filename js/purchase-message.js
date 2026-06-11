/* =========================================================================
   CedrickStore — Mensaje motivacional post-compra
   Se muestra después de que el usuario paga con monedero o completa un pedido.
   También maneja la entrega de credenciales con el inventario de cada producto.
   ========================================================================= */
(function() {
  'use strict';

  // Mensajes motivacionales aleatorios
  var MESSAGES = [
    '¡Gracias por tu compra! 🎉 Disfruta tu entretenimiento premium.',
    '¡Excelente elección! 🌟 Tu cuenta está lista para usar. ¡A disfrutar!',
    '¡Compra exitosa! 🚀 Gracias por confiar en CedrickStore.',
    '¡Listo! 🎬 Tu entretenimiento te espera. ¡Disfrútalo al máximo!',
    '¡Genial! ✨ Tus credenciales están listas. Gracias por elegirnos.',
    '¡Felicidades! 🏆 Ya puedes acceder a tu servicio. ¡Que lo disfrutes!',
    '¡Gracias por ser parte de CedrickStore! 💛 Tu satisfacción es nuestra prioridad.',
    '¡Pedido completado! 🎊 Recuerda que tienes 30 días de garantía.'
  ];

  function getMotivationalMessage() {
    return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  }

  // Exponer globalmente
  window.CS_PURCHASE_MSG = getMotivationalMessage;

  // Override del showSuccess del carrito para incluir mensaje motivacional
  var originalPayDigital = CS.payDigitalWithWallet;
  if (originalPayDigital) {
    CS.payDigitalWithWallet = function(email) {
      var result = originalPayDigital(email);
      if (result.ok) {
        result.motivationalMessage = getMotivationalMessage();
      }
      return result;
    };
  }
})();
