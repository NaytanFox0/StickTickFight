export class Segment {
    constructor(start, length, angle = 0, cos = { min: 0, max: 0 }, sin = { min: 0, max: 0 }) {
        this.start = start;
        this.oldStart = { ...start };
        this.length = length;
        this.angle = angle;
        this.cos = cos;
        this.sin = sin;
    }

    get end() {
        // diferença entre posição anterior e atual
        const dx = (this.oldStart.x + this.length * Math.cos(this.angle)) - this.start.x;
        const dy = (this.oldStart.y + this.length * Math.sin(this.angle)) - this.start.y;

        // atualiza ângulo com base no deslocamento
        this.angle = Math.atan2(dy, dx);

        // atualiza oldStart
        this.oldStart = { ...this.start };

        // calcula novo ponto final
        const x = this.start.x + this.length * Math.cos(this.angle);
        const y = this.start.y + this.length * Math.sin(this.angle);

        // garante que não ultrapasse o comprimento
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > this.length) {
            const delta = dist - this.length;
            const normX = dx / dist;
            const normY = dy / dist;
            return {
                x: x - delta * normX,
                y: y - delta * normY
            };
        }

        return { x, y };
    }
}

export class Player {
    constructor(x, y, color = '#33cc33', scale = 1) {
        this.scale = scale;
        this.color = color;

        // - Body
        //
        // Spine
        this.spine0 = new Segment({x, y}, 5);
        this.spine1 = new Segment(this.spine0.end, 20, Math.PI / 2);
        this.spine2 = new Segment(this.spine1.end, 20, Math.PI / 2);
        //
        // Left Arm
        this.leftArm0 = new Segment(this.spine0.end, 20, Math.PI / 4);
        this.leftArm1 = new Segment(this.leftArm0.end, 20, Math.PI / 4);
        //
        // Right Arm
        this.rightArm0 = new Segment(this.spine0.end, 20, Math.PI / 1.4);
        this.rightArm1 = new Segment(this.rightArm0.end, 20, Math.PI / 1.4);
        //
        // Left Leg
        this.leftLeg0 = new Segment(this.spine2.end, 20, Math.PI / 4);
        this.leftLeg1 = new Segment(this.leftLeg0.end, 20, Math.PI / 4);
        //
        // Right Leg
        this.rightLeg0 = new Segment(this.spine2.end, 20, Math.PI / 1.4);
        this.rightLeg1 = new Segment(this.rightLeg0.end, 20, Math.PI / 1.4);
    }

    update() {
        this.spine1.start = this.spine0.end;
        this.spine2.start = this.spine1.end;
        this.leftArm0.start = this.spine0.end;
        this.leftArm1.start = this.leftArm0.end;
        this.rightArm0.start = this.spine0.end;
        this.rightArm1.start = this.rightArm0.end;
        this.leftLeg0.start = this.spine2.end;
        this.leftLeg1.start = this.leftLeg0.end;
        this.rightLeg0.start = this.spine2.end;
        this.rightLeg1.start = this.rightLeg0.end;
    }


    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(this.spine0.start.x, this.spine0.start.y - 10 * this.scale, 10 * this.scale, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.spine1.start.x, this.spine1.start.y);
        ctx.lineTo(this.spine2.start.x, this.spine2.start.y);
        ctx.lineTo(this.spine2.end.x, this.spine2.end.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.leftArm0.start.x, this.leftArm0.start.y);
        ctx.lineTo(this.leftArm1.start.x, this.leftArm1.start.y);
        ctx.lineTo(this.leftArm1.end.x, this.leftArm1.end.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.rightArm0.start.x, this.rightArm0.start.y);
        ctx.lineTo(this.rightArm1.start.x, this.rightArm1.start.y);
        ctx.lineTo(this.rightArm1.end.x, this.rightArm1.end.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.leftLeg0.start.x, this.leftLeg0.start.y);
        ctx.lineTo(this.leftLeg1.start.x, this.leftLeg1.start.y);
        ctx.lineTo(this.leftLeg1.end.x, this.leftLeg1.end.y);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(this.rightLeg0.start.x, this.rightLeg0.start.y);
        ctx.lineTo(this.rightLeg1.start.x, this.rightLeg1.start.y);
        ctx.lineTo(this.rightLeg1.end.x, this.rightLeg1.end.y);
        ctx.stroke();
    }
}
