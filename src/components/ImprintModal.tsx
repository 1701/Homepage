import React from 'react';

interface ImprintModalProps {
  onClose: () => void;
}

const ImprintModal: React.FC<ImprintModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="bg-blue-800 border-4 border-gray-300 shadow-[10px_10px_0_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Window Header */}
        <div className="bg-gray-300 text-black px-2 py-1 flex justify-between items-center font-dos text-base md:text-lg">
          <span>IMPRINT.TXT - EDIT.EXE</span>
          <button onClick={onClose} className="bg-red-600 text-white px-2 border border-black hover:bg-red-500">X</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto font-dos text-xl text-white space-y-4">
          <h2 className="text-2xl text-yellow-300 border-b border-white pb-2 mb-4">Impressum</h2>
          
          <div className="space-y-2">
            <p className="font-bold">Angaben gemäß § 5 DDG</p>
            <p>Markus Steireif</p>
            <p>Maisenbachstr. 2</p>
            <p>76359 Marxzell</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold">Kontakt</p>
            <p>Telefon: +49 151 41688724</p>
            <p>E-Mail: markus.steireif@gmx.de</p>
          </div>

          <div className="space-y-2">
            <p className="font-bold">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</p>
            <p>Markus Steireif</p>
            <p>Maisenbachstr. 2</p>
            <p>76359 Marxzell</p>
          </div>
          
          <div className="pt-4 border-t border-blue-400 text-sm text-gray-300">
            <p>Haftungsausschluss: Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
          </div>

           <button 
            onClick={onClose}
            className="bg-gray-300 text-black font-dos px-4 py-2 hover:bg-white active:translate-y-1 border-b-4 border-r-4 border-gray-600"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImprintModal;