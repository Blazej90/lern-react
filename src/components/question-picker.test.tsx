// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import QuestionPicker from "./question-picker";
import { REACT_QUESTIONS } from "@/data/react-questions";

afterEach(cleanup);

const button = () => screen.getByRole("button", { name: /losuj pytanie/i });

describe("QuestionPicker", () => {
  it("passes a question from the bank to onPick", () => {
    const onPick = vi.fn();
    render(<QuestionPicker hidden={false} onPick={onPick} />);

    fireEvent.click(button());

    expect(onPick).toHaveBeenCalledTimes(1);
    expect(REACT_QUESTIONS).toContain(onPick.mock.calls[0][0]);
  });

  it("never picks the same question twice in a row", () => {
    // Always take the first candidate: without the guard this would
    // return REACT_QUESTIONS[0] every time.
    vi.spyOn(Math, "random").mockReturnValue(0);
    const onPick = vi.fn();
    render(<QuestionPicker hidden={false} onPick={onPick} />);

    fireEvent.click(button());
    fireEvent.click(button());
    fireEvent.click(button());

    const picks = onPick.mock.calls.map(([q]) => q);
    expect(picks).toEqual([REACT_QUESTIONS[0], REACT_QUESTIONS[1], REACT_QUESTIONS[0]]);
  });

  it("remembers the last question while hidden", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const onPick = vi.fn();
    const { rerender } = render(<QuestionPicker hidden={false} onPick={onPick} />);

    fireEvent.click(button());
    rerender(<QuestionPicker hidden onPick={onPick} />);
    rerender(<QuestionPicker hidden={false} onPick={onPick} />);
    fireEvent.click(button());

    expect(onPick.mock.calls.map(([q]) => q)).toEqual([
      REACT_QUESTIONS[0],
      REACT_QUESTIONS[1],
    ]);
  });

  it("renders nothing when hidden", () => {
    render(<QuestionPicker hidden onPick={vi.fn()} />);

    expect(screen.queryByRole("button")).toBeNull();
  });
});
