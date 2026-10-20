"use client";

import React, { useState } from "react";
import axios from "axios";
import { SignedIn } from "@clerk/nextjs";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Export and delete buttons on the privacy page; only for signed-in users.
const DataControls: React.FC = () => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const deleteHistory = async () => {
    setIsDeleting(true);
    try {
      await axios.delete("/api/my-data");
      setMessage({ text: "Cała historia odpowiedzi została usunięta.", isError: false });
    } catch (error) {
      console.error("Error deleting user data:", error);
      setMessage({ text: "Nie udało się usunąć danych. Spróbuj ponownie.", isError: true });
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  return (
    <SignedIn>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="outline">
          <a href="/api/my-data" download>
            <Download className="w-4 h-4" />
            Pobierz moje dane (JSON)
          </a>
        </Button>
        <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
          <Trash2 className="w-4 h-4" />
          Usuń całą historię odpowiedzi
        </Button>
      </div>

      {message && (
        <p
          role="status"
          className={`mt-3 text-sm ${message.isError ? "text-red-500" : "text-green-600 dark:text-green-400"}`}
        >
          {message.text}
        </p>
      )}

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usunąć całą historię?</DialogTitle>
            <DialogDescription>
              Usuniesz wszystkie swoje odpowiedzi i oceny AI. Tej operacji nie
              można cofnąć. Limit pytań w wersji demonstracyjnej się nie zmieni.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>
                Anuluj
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={deleteHistory} disabled={isDeleting}>
              {isDeleting ? "Usuwanie…" : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SignedIn>
  );
};

export default DataControls;
