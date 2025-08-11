export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ Sistema Funcionando!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Move Marias - PostgreSQL Ativo
        </p>
        <div className="bg-green-100 p-6 rounded-lg">
          <p className="text-green-800">
            Se você está vendo esta página, significa que:
          </p>
          <ul className="text-left text-green-700 mt-4 space-y-2">
            <li>✅ Frontend está carregando</li>
            <li>✅ React está funcionando</li>
            <li>✅ Roteamento está OK</li>
            <li>✅ Sistema está online</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
