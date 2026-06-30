import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersRepository } from './users.repository';
import { UserEntity } from './user.entity';
import { UserRole } from './dto/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ServerUsersService {

    // Injecting the repository
    constructor(private readonly usersRepository: UsersRepository){}

    async findByEmail(email: string): Promise<UserEntity> {
        const user = await this.usersRepository.findByEmail(email);

        if(!user) throw new NotFoundException(`Utente con email ${email} non trovato`);

        return user;
    }

    async getOneUser(id: number): Promise<UserEntity> {
        const user = await this.usersRepository.findById(id);

        if(!user) throw new NotFoundException(`Utente con id ${id} non trovato`);

        return user;
    }

    async getUsers(role?: UserRole): Promise<UserEntity[]> {
        const users = await this.usersRepository.findAll(role);
        
/*         if(role && users.length===0)
        {
            throw new NotFoundException(`No users found with role ${role}`);
        } */
        return users;
    }

    async create(dto: CreateUserDto): Promise<UserEntity> {
        const existing = dto.email
            ? await this.usersRepository.findByEmail(dto.email)
            : null;

        if (existing) {
            throw new ConflictException('Email già in uso, modificare l\'indirizzo email');
        }

        const passwordHash = await bcrypt.hash(dto.password,10);
        return this.usersRepository.createOne(dto,passwordHash);
    }

    async update(id: number, dto: UpdateUserDto): Promise<UserEntity> {
        if (dto.email) {
            const existing = await this.usersRepository.findByEmail(dto.email);
            if (existing && existing.id !== id) {
                throw new ConflictException('Email già in uso, modificare l\'indirizzo email');
            }
        }

        const updated = await this.usersRepository.updateOne(id, dto);
        if (!updated) {
            throw new NotFoundException(`Utente con id ${id} non trovato`);
        }

        return updated;
    }

    async removeUser(id: number): Promise<void> {
        const deleted = await this.usersRepository.deleteOne(id);
        if (!deleted) {
            throw new NotFoundException(`Utente con id ${id} non trovato`);
        }
    }

    async updatePassword(user: UserEntity, newPassword: string) {
        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        const updated = await this.usersRepository.updateOne(user.id, { password: passwordHash });
        
        if (!updated) {
            throw new NotFoundException(`Utente con id ${user.id} non trovato`);
        }

        return updated;
    }
}
