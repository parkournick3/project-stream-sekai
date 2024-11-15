import { useCallback, useEffect, useMemo, useState } from "react";
import { Wheel } from "react-custom-roulette";
import { HexColorPicker } from "react-colorful";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { TrophyIcon } from "lucide-react";
import { Slider } from "./components/ui/slider";
import { Label } from "./components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import JSConfetti from "js-confetti";
import { darkenColor } from "./lib/utils";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./components/ui/alert-dialog";

const jsConfetti = new JSConfetti();

type TransformedData = {
  option: string;
  id: number;
  points: number;
  tickets: { positive: number; negative: number };
  style: { backgroundColor: string };
}[];

const MAX_FONTSIZE = 20;
const MIN_FONTSIZE = 10;

const App = () => {
  const [data, setData] = useState<
    {
      option: string;
      style: { backgroundColor: string };
      id: number;
      points: number;
      type: "positive" | "negative";
      order: number;
    }[]
  >([
    {
      option: "Janis",
      style: { backgroundColor: "pink" },
      id: 1,
      points: 0,
      type: "positive",
      order: 1,
    },
    {
      option: "Nicolas",
      style: { backgroundColor: "blue" },
      id: 2,
      points: 0,
      type: "positive",
      order: 2,
    },
  ]);

  const [transformedData, setTransformedData] = useState<TransformedData>([]);

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [winnerDialogOpen, setWinnerDialogOpen] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [color, setColor] = useState("#aabbcc");
  const [name, setName] = useState("");
  const [spins, setSpins] = useState(0);
  const [positiveTickets, setPositiveTickets] = useState(5);
  const [negativeTickets, setNegativeTickets] = useState(5);
  const [configs, setConfigs] = useState({
    spinDuration: 0.5,
    loseEmojis: "☠️",
    winEmojis: "🎉",
    confettiNumber: 100,
    confettiSize: 100,
    winTargetPoints: 10,
    wheelSize: 800,
  });
  const showWheel = useMemo(() => data.length > 0, [data]);

  const winner = useMemo(() => {
    return transformedData.find(
      (item) => item.points >= configs.winTargetPoints
    );
  }, [transformedData, configs.winTargetPoints]);

  const hasWinner = useMemo(() => {
    return Boolean(winner);
  }, [winner]);

  useEffect(() => {
    if (hasWinner) {
      setWinnerDialogOpen(true);
      setAutoMode(false);
    }
  }, [hasWinner, winner]);

  const handleSpinClick = () => {
    if (!mustSpin && !hasWinner) {
      const newPrizeNumber = Math.floor(Math.random() * data.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
      setSpins((prev) => prev + 1);
    }
  };

  const createNewOption = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      const newData = [...data];

      const id = new Date().getTime();

      for (let i = 0; i < positiveTickets; i++) {
        newData.push({
          option: name,
          style: { backgroundColor: color },
          id,
          points: 0,
          type: "positive",
          order: Math.random(),
        });
      }

      for (let i = 0; i < negativeTickets; i++) {
        const darkenedColor = darkenColor(color, 20);
        newData.push({
          option: name,
          style: { backgroundColor: darkenedColor },
          id,
          points: 0,
          type: "negative",
          order: Math.random(),
        });
      }

      setData(
        newData
          .map((item) => {
            return {
              ...item,
              order: Math.random(),
            };
          })
          .sort((a, b) => a.order - b.order)
      );

      setName("");
      setPositiveTickets(10);
      setNegativeTickets(10);
    },
    [data, name, positiveTickets, negativeTickets, color, transformedData]
  );

  const processData = useCallback(() => {
    const groupedData = data.reduce((acc, item) => {
      const existing = acc.find((entry) => entry.id === item.id);

      if (existing) {
        existing.points += item.points;
        existing.tickets[item.type]++;
      } else {
        acc.push({
          option: item.option,
          id: item.id,
          points: item.points,
          tickets: {
            positive: item.type === "positive" ? 1 : 0,
            negative: item.type === "negative" ? 1 : 0,
          },
          style: item.style,
        });
      }

      return acc;
    }, [] as TransformedData);

    return groupedData;
  }, [data]);

  useEffect(() => {
    setTransformedData(processData());
  }, [data, processData]);

  const fontSize = useMemo(() => {
    const optionsNumber = data.length;
    const fontSize = MAX_FONTSIZE - optionsNumber;
    return fontSize < MIN_FONTSIZE ? MIN_FONTSIZE : fontSize;
  }, [data]);

  const enableCreateButton = useMemo(() => {
    return name.length > 0 && positiveTickets > 0;
  }, [name, positiveTickets]);

  const handleAutoMode = () => {
    if (autoMode === false) {
      handleSpinClick();
      setAutoMode(true);
    } else {
      setAutoMode(false);
    }
  };

  useEffect(() => {
    if (autoMode && hasWinner) {
      setAutoMode(false);
    }
    if (autoMode && !hasWinner && !mustSpin) {
      setTimeout(() => {
        handleSpinClick();
      }, 1500);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, hasWinner, mustSpin]);

  return (
    <>
      <Dialog open={winnerDialogOpen} onOpenChange={setWinnerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <p className="text-2xl">
                O prêmio vai para... <strong>{winner?.option}</strong> com{" "}
                {winner?.points} pontos 🎉 A roleta girou{" "}
                <strong>{spins}</strong> vezes.
              </p>
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <div className="h-screen flex items-center justify-center flex-col gap-20 p-20 overflow-hidden">
        <div className="flex justify-center w-full h-full">
          <div
            className="wheel-container"
            style={{
              width: configs.wheelSize,
              height: configs.wheelSize,
            }}
          >
            {showWheel && (
              <Wheel
                mustStartSpinning={mustSpin}
                prizeNumber={prizeNumber}
                outerBorderWidth={1}
                innerBorderWidth={1}
                radiusLineWidth={1}
                innerRadius={10}
                fontSize={fontSize}
                fontWeight={200}
                innerBorderColor="white"
                radiusLineColor="white"
                data={data.map((item) => {
                  return {
                    ...item,
                    option:
                      item.type === "positive"
                        ? item.option + " +1"
                        : item.option + " -1",
                  };
                })}
                spinDuration={configs.spinDuration}
                onStopSpinning={() => {
                  setData((prevData) =>
                    prevData.map((item, index) => {
                      if (index === prizeNumber) {
                        if (item.type === "positive") {
                          item.points += 1;
                          jsConfetti.addConfetti({
                            emojis: configs.winEmojis.split(","),
                            confettiNumber: configs.confettiNumber,
                            emojiSize: configs.confettiSize,
                          });
                          toast.success(`${item.option} ganhou 1 ponto`);
                        }
                        if (item.type === "negative") {
                          item.points -= 1;
                          jsConfetti.addConfetti({
                            emojis: configs.loseEmojis.split(","),
                            confettiNumber: configs.confettiNumber,
                            emojiSize: configs.confettiSize,
                          });
                          toast.error(`${item.option} perdeu 1 ponto`);
                        }
                      }
                      return item;
                    })
                  );

                  const newTransformedData = processData();
                  setTransformedData(newTransformedData);

                  const winner = newTransformedData.find(
                    (item) => item.points >= configs.winTargetPoints
                  );

                  if (winner) {
                    setAutoMode(false);
                  }

                  setMustSpin(false);
                }}
              />
            )}
          </div>

          <div className="flex gap-4 flex-col p-6 border-2 rounded-md max-h-full">
            <h4 className="text-center">Pontuação</h4>
            <ul className="overflow-y-auto max-h-full flex gap-2 flex-col">
              {transformedData
                .sort((a, b) => b.points - a.points)
                .map((item, index) => (
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Tooltip>
                        <TooltipTrigger className="w-full">
                          <li
                            key={index}
                            className="flex items-center text-center p-2 flex-col rounded-sm justify-around border w-full border-b-8"
                            style={{
                              borderColor: item.style.backgroundColor,
                            }}
                          >
                            {index === 0 && (
                              <div className="my-2">
                                <TrophyIcon className="text-orange-400" />
                              </div>
                            )}
                            <div>
                              <div>
                                <span>
                                  {item.option}: <strong>{item.points}</strong>
                                </span>
                              </div>
                              <div>
                                Tickets:{" "}
                                <span className="text-green-600">
                                  {item.tickets.positive}
                                </span>{" "}
                                |{" "}
                                <span className="text-red-600">
                                  {item.tickets.negative}
                                </span>
                              </div>
                            </div>
                          </li>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Clique para excluir o participante</p>
                        </TooltipContent>
                      </Tooltip>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Tem certeza que quer excluir este participante?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Não dá pra voltar atrás, tô avisando...
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            setData((prevData) =>
                              prevData.filter((data) => data.id !== item.id)
                            )
                          }
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ))}
            </ul>

            <div className="flex-1" />
            <div className="flex flex-col gap-4">
              <Dialog>
                <DialogTrigger>Adicionar novo participante</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adiciona eu ae pae</DialogTitle>
                    <DialogDescription>
                      <form
                        onSubmit={createNewOption}
                        className="flex flex-col gap-4"
                      >
                        <Label>Nome do participante</Label>
                        <Input
                          type="text"
                          placeholder="Nome"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />

                        <Label>Tickets positivos</Label>
                        <Slider
                          value={[positiveTickets]}
                          max={100}
                          step={1}
                          onValueChange={(e) => setPositiveTickets(Number(e))}
                          className="w-56"
                        />
                        <span>{positiveTickets}</span>

                        <Label>Tickets negativos</Label>
                        <Slider
                          value={[negativeTickets]}
                          max={100}
                          step={1}
                          onValueChange={(e) => setNegativeTickets(Number(e))}
                          className="w-56"
                        />
                        <span>{negativeTickets}</span>

                        <Label>Cor</Label>
                        <HexColorPicker color={color} onChange={setColor} />

                        <Button disabled={!enableCreateButton}>
                          Criar novo opção na roleta
                        </Button>
                      </form>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger>Configurações</DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Aqui tu faz o que tu quiser</DialogTitle>
                    <DialogDescription>
                      <div className="flex flex-col gap-4">
                        <Label>
                          Velocidade da roleta (quanto menor, mais rápido)
                        </Label>
                        <Slider
                          value={[configs.spinDuration]}
                          max={1}
                          min={0.01}
                          step={0.01}
                          onValueChange={(e) =>
                            setConfigs((prev) => ({
                              ...prev,
                              spinDuration: Number(e[0]),
                            }))
                          }
                          className="w-56"
                        />
                        <span>{configs.spinDuration}</span>

                        <Label>Emojis de vitória (separados por vírgula)</Label>
                        <Input
                          type="text"
                          value={configs.winEmojis}
                          onChange={(e) =>
                            setConfigs((prev) => ({
                              ...prev,
                              winEmojis: e.target.value,
                            }))
                          }
                        />

                        <Label>Emojis de derrota (separados por vírgula)</Label>
                        <Input
                          type="text"
                          value={configs.loseEmojis}
                          onChange={(e) =>
                            setConfigs((prev) => ({
                              ...prev,
                              loseEmojis: e.target.value,
                            }))
                          }
                        />

                        <Label>Número de confetes</Label>
                        <Slider
                          value={[configs.confettiNumber]}
                          max={5000}
                          step={10}
                          onValueChange={(e) =>
                            setConfigs((prev) => ({
                              ...prev,
                              confettiNumber: Number(e),
                            }))
                          }
                          className="w-56"
                        />
                        <span>{configs.confettiNumber}</span>

                        <Label>Tamanho dos confetes</Label>
                        <Slider
                          value={[configs.confettiSize]}
                          max={100}
                          step={1}
                          onValueChange={(e) =>
                            setConfigs((prev) => ({
                              ...prev,
                              confettiSize: Number(e),
                            }))
                          }
                          className="w-56"
                        />
                        <span>{configs.confettiSize}</span>

                        <Label>Pontuação para vencer</Label>
                        <Slider
                          value={[configs.winTargetPoints]}
                          max={100}
                          step={1}
                          onValueChange={(e) =>
                            setConfigs((prev) => ({
                              ...prev,
                              winTargetPoints: Number(e),
                            }))
                          }
                          className="w-56"
                        />
                        <span>{configs.winTargetPoints}</span>

                        <Label>Tamanho da roleta</Label>
                        <Slider
                          value={[configs.wheelSize]}
                          max={2000}
                          min={800}
                          step={10}
                          onValueChange={(e) =>
                            setConfigs((prev) => ({
                              ...prev,
                              wheelSize: Number(e),
                            }))
                          }
                          className="w-56"
                        />
                        <span>{configs.wheelSize}</span>
                      </div>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="space-x-2">
          <Button disabled={hasWinner} onClick={handleSpinClick}>
            Girar
          </Button>

          <Button disabled={hasWinner} onClick={handleAutoMode}>
            {autoMode ? "Desligar modo automático" : "Modo automático"}
          </Button>

          {/* reset */}

          <Button
            onClick={() => {
              setData([]);
              setTransformedData([]);
              setMustSpin(false);
              setPrizeNumber(0);
              setWinnerDialogOpen(false);
              setAutoMode(false);
              setColor("#aabbcc");
              setName("");
              setSpins(0);
              setPositiveTickets(5);
              setNegativeTickets(5);
              setConfigs({
                spinDuration: 0.25,
                loseEmojis: "☠️",
                winEmojis: "🎉",
                confettiNumber: 100,
                confettiSize: 100,
                winTargetPoints: 10,
                wheelSize: 800,
              });
            }}
          >
            Resetar
          </Button>
        </div>
      </div>
    </>
  );
};

export default App;
