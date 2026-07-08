export interface Fact {
  id: string;
  trigger_value: number | null;
  trigger_type: "exact" | "range" | "unit_conversion" | "property";
  range_min: number | null;
  range_max: number | null;
  category: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  override_chance: number;
  format_family: string;
  copy_template: string;
}

const BASE_GAP_MS = 15 * 60 * 1000; // 15 minutes

export class CuriosityEngine {
  private facts: Fact[] = [];
  private cf: number = 1.0;
  private lastShownAt: number = 0;
  private pendingFact: Fact | null = null;
  
  constructor() {
    this.loadState();
  }
  
  private loadState() {
    if (typeof window !== 'undefined') {
      const savedCF = localStorage.getItem('calcoon_cf');
      if (savedCF) this.cf = parseFloat(savedCF);
      
      const savedLast = localStorage.getItem('calcoon_last_shown');
      if (savedLast) this.lastShownAt = parseInt(savedLast, 10);
      
      const savedPending = localStorage.getItem('calcoon_pending');
      if (savedPending) this.pendingFact = JSON.parse(savedPending);
    }
  }
  
  private saveState() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calcoon_cf', this.cf.toString());
      localStorage.setItem('calcoon_last_shown', this.lastShownAt.toString());
      if (this.pendingFact) {
        localStorage.setItem('calcoon_pending', JSON.stringify(this.pendingFact));
      } else {
        localStorage.removeItem('calcoon_pending');
      }
    }
  }

  public setFacts(facts: Fact[]) {
    this.facts = facts;
  }
  
  public recordInteraction(interaction: 'engaged' | 'dismissed' | 'ignored') {
    if (interaction === 'engaged') {
      this.cf = Math.max(0.5, this.cf * 0.85);
    } else {
      this.cf = Math.min(2.0, this.cf * 1.15);
    }
    this.saveState();
  }

  public checkForFact(result: number): Fact | null {
    // 1. Check pending fact first if cooldown clears
    const now = Date.now();
    const currentGap = BASE_GAP_MS * this.cf;
    const cooldownCleared = (now - this.lastShownAt) >= currentGap;
    
    if (this.pendingFact && cooldownCleared) {
      const fact = this.pendingFact;
      this.pendingFact = null;
      this.lastShownAt = now;
      this.saveState();
      return fact;
    }

    // 2. Find a matching fact
    const matchedFact = this.facts.find(f => {
      if (f.trigger_type === 'exact' && f.trigger_value === result) return true;
      if (f.trigger_type === 'range' && f.range_min !== null && f.range_max !== null) {
        return result >= f.range_min && result <= f.range_max;
      }
      return false;
    });

    if (!matchedFact) return null;

    // 3. Roll for suppression/override
    if (!cooldownCleared) {
      const roll = Math.random();
      if (roll < matchedFact.override_chance) {
        this.lastShownAt = now;
        this.saveState();
        return matchedFact; // overridden cooldown!
      } else {
        // queue it (only if no pending or if this is higher rarity)
        // Simplified: just set as pending.
        this.pendingFact = matchedFact;
        this.saveState();
        return null;
      }
    }

    // 4. Normal show
    this.lastShownAt = now;
    this.saveState();
    return matchedFact;
  }
}

export const curiosity = new CuriosityEngine();
